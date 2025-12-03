import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string; // Using emoji/unicode icons as fallback
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Robotic Nervous System (ROS 2)',
    icon: '🤖',
    description: (
      <>
        Learn ROS 2 fundamentals: Nodes, Topics, Services, and URDF for humanoid robots. Bridge Python agents to ROS controllers for advanced robotic control.
      </>
    ),
  },
  {
    title: 'Digital Twin & Simulation',
    icon: '🔮',
    description: (
      <>
        Build realistic simulations with Gazebo and Unity. Simulate physics, sensors (LiDAR, Depth Cameras, IMU), and human-robot interactions.
      </>
    ),
  },
  {
    title: 'AI-Robot Brain (NVIDIA Isaac)',
    icon: '🧠',
    description: (
      <>
        Develop perception, navigation, and manipulation using NVIDIA Isaac. Train AI models in photorealistic simulations and deploy them to edge devices.
      </>
    ),
  },
  {
    title: 'Vision-Language-Action (VLA)',
    icon: '👁️',
    description: (
      <>
        Integrate LLMs and robotics for voice-to-action commands. Plan complex tasks, navigate obstacles, and manipulate objects autonomously.
      </>
    ),
  },
  {
    title: 'Capstone: Autonomous Humanoid',
    icon: '🎯',
    description: (
      <>
        Apply all modules to build a simulated humanoid robot that perceives, plans, and interacts in real-world scenarios using AI and robotics integration.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconGlow}></div>
          <div className={styles.featureIcon}>{icon}</div>
        </div>
        <div className={styles.featureContent}>
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Learning Path</span>
          <h2 className={styles.sectionTitle}>
            Master <span className={styles.gradientText}>Humanoid Robotics</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            From simulation to deployment—build intelligent robots with cutting-edge AI and robotics frameworks
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}