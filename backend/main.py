from fastapi import FastAPI, Depends, HTTPException, status,Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Literal, Optional # Ensure Optional and Literal are imported
import os
from dotenv import load_dotenv


# --- CHATBOT ----
from agents import Agent, Runner 
from my_config import openrouter_key, open_router_config
from qdrant.retrieving import retrieve

# --- AUTH & DB IMPORTS ---
from auth.db import init_db, get_session
from auth.models import User 
from auth.schemas import UserCreate, UserRead, Token
from auth.auth import (
    get_password_hash, 
    verify_password, 

    create_access_token, 
    create_refresh_token, 
    get_current_user,
    decode_token
)


# --- STARTUP EVENT ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

# --- CORS SETUP ---
# Combine your WEB_URL with localhost for flexibility
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.00.1:3000",
]

load_dotenv()

web_url = os.getenv("")
if web_url:
    origins.append(web_url)

print("🌐 CORS allowed origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
)

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/register", response_model=UserRead)
async def register(user: UserCreate, session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    result = await session.exec(statement)
    existing_user = result.first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    
    new_user = User(
        email=user.email, 
        name=user.name,
        software_experience=user.software_experience,
        hardware_experience=user.hardware_experience,
        hashed_password=hashed_pwd
    )
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    """
    Login to get Access Token and Refresh Token.
    """
    statement = select(User).where(User.email == form_data.username)
    result = await session.exec(statement)
    user = result.first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }

@app.post("/refresh", response_model=Token)
async def refresh_token(token_data: dict, session: AsyncSession = Depends(get_session)):
    """
    Use a long-lived refresh token to get a new access token.
    """
    refresh_token_str = token_data.get("refresh_token")
    if not refresh_token_str:
        raise HTTPException(status_code=400, detail="Refresh token missing")

    payload = decode_token(refresh_token_str)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    email = payload.get("sub")
    statement = select(User).where(User.email == email)
    result = await session.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return {
        "access_token": create_access_token(data={"sub": user.email}),
        "refresh_token": create_refresh_token(data={"sub": user.email}),
        "token_type": "bearer"
    }

@app.get("/users/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current logged-in user profile (includes Name, Software/Hardware Experience).
    """
    return current_user



# ==========================================
# USER PREFERENCE ENDPOINTS
# ==========================================

@app.get("/preference", response_model=UserRead)
async def get_user_preference(current_user: User = Depends(get_current_user)):
    """
    Retrieves the current logged-in user's profile, which includes preference-like fields
    such as software_experience and hardware_experience.
    """
    return current_user


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    software_experience: Optional[str] = None
    hardware_experience: Optional[str] = None

@app.put("/users/me", response_model=UserRead)
async def update_users_me(
    update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Update current user fields: name, email, software_experience, hardware_experience
    """
    user_data = update.dict(exclude_unset=True)

    for key, value in user_data.items():
        setattr(current_user, key, value)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user


# ==========================================
# CONTENT CUSTOMIZATION ENDPOINTS
# ==========================================


class CustomizeTextRequest(BaseModel):
    text: str
    software_experience: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    hardware_experience: Literal["beginner", "intermediate", "advanced"] = "intermediate"

@app.post("/customize_text")
async def customize_text_content(
    request_data: CustomizeTextRequest,
    current_user: User = Depends(get_current_user), # Still require authenticated user
    session: AsyncSession = Depends(get_session) # Not directly used but kept for consistency
):
    """
    Customizes the provided text based on user's software and hardware experience levels
    using an LLM agent.
    """
    print(f"📥 Received customization request for user {current_user.email} with preferences:")
    print(f"   Software Experience: {request_data.software_experience}")
    print(f"   Hardware Experience: {request_data.hardware_experience}")
    print(f"   Text (first 100 chars): {request_data.text[:100]}...")

    try:
        # Define the Agent specifically for content customization
        customization_agent = Agent(
            name="Content Customization AI",
            instructions=f"""
            You are an AI assistant specialized in adapting technical content about Physical AI and Humanoid Robotics.
            Your task is to rewrite the provided text to match the user's specified experience levels.

            ### CUSTOMIZATION GUIDELINES:
            -   **Target Audience:** The user has indicated their experience level in software as '{request_data.software_experience}' and hardware as '{request_data.hardware_experience}'.
            -   **Beginner Level:**
                -   Simplify complex jargon.
                -   Provide brief, clear explanations for technical terms.
                -   Focus on high-level concepts rather than deep implementation details.
                -   Use analogies if helpful.
                -   Keep sentences relatively short and direct.
            -   **Intermediate Level:**
                -   Explain technical terms clearly but assume some foundational understanding.
                -   Mention key concepts and tools without excessive detail on basics.
                -   Can introduce slightly more complex ideas but still with explanations.
            -   **Advanced Level:**
                -   Assume familiarity with most common technical terms and concepts.
                -   Focus on precision, efficiency, and deeper technical insights.
                -   Can use specialized jargon without extensive explanation.
                -   Delve into implementation aspects, performance considerations, and advanced topics.

            ### PROCESS:
            1.  Read the provided text carefully.
            2.  Rewrite the entire text, making sure it aligns with the '{request_data.software_experience}' software experience and '{request_data.hardware_experience}' hardware experience.
            3.  Maintain all factual information and the original meaning.
            4.  Output only the rewritten text, do not add conversational remarks.
            """,
            tools=[retrieve] 
        )

        messages_for_llm = [
            ChatMessage(role="user", text=f"Please rewrite the following content for a user with software experience '{request_data.software_experience}' and hardware experience '{request_data.hardware_experience}':\n\n{request_data.text}")
        ]

        customized_result = await Runner.run(
            customization_agent,
            input="\n".join([f"{m.role}: {m.text}" for m in messages_for_llm]), 
            run_config=open_router_config, 
        )

        print("✅ Content customized successfully")
        return {"customized_content": customized_result.final_output}

    except Exception as e:
        print("❌ Customization Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to customize content: {str(e)}")

# ==========================================
# CHATBOT ENDPOINTS
# ==========================================

class ChatMessage(BaseModel):
    role: Literal["user", "bot"]
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@app.post("/ask")
async def chat(request: ChatRequest):
    
    print("📥 Received messages:", request.messages)
    
    agent = Agent(
        name="Physical AI & Humanoid Robotics Agent",
        instructions= """
You are the **Specialized AI Assistant** for the **Physical AI & Humanoid Robotics Capstone Course**.
Your primary function is to support students in understanding the curriculum, hardware prerequisites, system architectures, and foundational principles that connect a digital AI "brain" to a physical robotic body.

---

## **COURSE CONTEXT**

**Domain:** Embodied AI — the integration of machine intelligence with robots operating in simulated and real physical environments.
**Objective:** Guide students as they apply AI techniques to humanoid and quadruped robots using **ROS 2**, **Gazebo**, **Unity**, and **NVIDIA Isaac**.

---

## **CURRICULUM OVERVIEW**

### **1. The Robotic Nervous System (ROS 2)**
* Node graph architecture
* Topics, services, actions
* `rclpy` development
* URDF modeling and kinematics

### **2. The Digital Twin (Simulation Layer)**
* **Gazebo** physics-based simulation
* **Unity** for high-level visualization
* Collision dynamics, LiDAR, depth camera modeling

### **3. The AI–Robot Brain (NVIDIA Isaac)**
* Isaac Sim for photorealistic simulation
* Isaac ROS for perception (e.g., VSLAM)
* Nav2 for mapping, navigation, motion planning

### **4. Vision–Language–Action (VLA) Systems**
* Whisper for speech-to-text
* LLMs for goal decomposition
* Mapping natural-language commands to ROS 2 action graphs
* Example: "Clean the room" → perception → navigation → manipulation sequence

---

## **HARDWARE REQUIREMENTS (CRITICAL)**

### **Simulation Workstation**
* **GPU:** NVIDIA RTX 4070 Ti (12GB VRAM) minimum (Recommended: RTX 3090/4090)
* **CPU:** Intel i7 (13th Gen+) or equivalent
* **RAM:** 64GB DDR5
* **OS:** Ubuntu 22.04 LTS

### **Edge AI Deployment**
* NVIDIA Jetson Orin Nano (8GB) or Orin NX

### **Sensors**
* Intel RealSense D435i
* USB IMU (generic)
* ReSpeaker Microphone Array

### **Robotics Platforms**
* Unitree Go2 Edu (quadruped proxy)
* Unitree G1 (humanoid)
* Hiwonder TonyPi Pro (budget option for kinematics labs)

---

## **LAB SETUP OPTIONS**

### **On-Prem (High CapEx)**
Hardware-owned physical labs using local workstations and robots.

### **Cloud / Ether Lab (High OpEx)**
* AWS g5.2xlarge GPU instances (~$205/quarter)
* Jetson kit for local robotic deployment (~$700)

---

## **ANSWERING RULES**

### **1. Mandatory Tool Use**
Before answering **any question** related to:
* Humanoid robotics
* Physical AI
* ROS 2
* Isaac
* Sensors
* Simulation

You **must call the `retrieve_data` tool** to access relevant information from the course knowledge base.
Only respond after retrieving and summarizing the data.

### **2. Tone & Style**
* Technical, academic, and helpful
* Use Markdown formatting
* Highlight important terms in **bold**

### **3. Scope**
* Stick strictly to course material + retrieved knowledge base
* Avoid unsupported speculation
* Produce accurate, concise explanations

### **4. Refusals**
Politely decline unrelated questions (e.g., weather, humor, politics).

### **5. Hardware-Specific Answers**
* Always include precise specs (VRAM, OS version, CPU class)
* Identify performance bottlenecks where relevant

---

You operate strictly under these constraints and respond consistently according to them.
        """,
        tools = [retrieve]
    )

    print("⚙️ Running agent (Non-Streamed)...")
    

    conversation_input = "\n".join(
        [f"{msg.role}: {msg.text}" for msg in request.messages]
    )

    result = await Runner.run(
        agent,
        input=conversation_input,
        run_config=open_router_config,
    )

    print("✅ Response generated successfully")
    
    return {"role": "bot", "text": result.final_output}


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/")
async def health_check():
    """API health check endpoint."""
    return {
        "status": "healthy",
        "api_key_configured": bool(openrouter_key),
        "web_url": os.getenv("WEB_URL", "not configured"),
    }