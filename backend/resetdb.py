import asyncio
from auth.db import engine
from sqlmodel import SQLModel

async def reset():
    print("Dropping old tables...")
    async with engine.begin() as conn:
        # This deletes the 'user' table
        await conn.run_sync(SQLModel.metadata.drop_all)
        print("Creating new tables...")
        # This creates the table again with the NEW columns
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Done! Database is updated.")

if __name__ == "__main__":
    asyncio.run(reset())