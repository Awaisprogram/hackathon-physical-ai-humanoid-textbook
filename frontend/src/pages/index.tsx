import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from "../components/HomepageFeatures"
import styles from './index.module.css';
import AIAssistantWidget from '../components/HomepageFeatures/Chatbot';

// Tech stack data for badges
const TECH_STACK = [
  { label: 'ROS 2', color: '#22314E' },
  { label: 'NVIDIA Isaac', color: '#76B900' },
  { label: 'PyTorch', color: '#EE4C2C' },
  { label: 'Gazebo', color: '#F5821F' },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroWrapper}>
      {/* Background Animated Elements */}
      <div className={styles.bgGrid}></div>
      <div className={styles.bgGlow}></div>

      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.gridSystem}>
          
          {/* LEFT COLUMN: Content */}
          <div className={styles.contentCol}>
            <div className={styles.badge}>Beta v1.0 Available</div>
            
            <Heading as="h1" className={styles.heroTitle}>
              Physical AI & <br />
              <span className={styles.gradientText}>Humanoid Robotics</span>
            </Heading>

            <p className={styles.heroSubtitle}>
              Bridge the gap between <strong>Sim</strong> and <strong>Real</strong>. 
              Master Embodied Intelligence, Reinforcement Learning, and Whole-Body Control 
              for the next generation of humanoid robots.
            </p>

            {/* Tech Stack Chips */}
            <div className={styles.techStack}>
              <span className={styles.techLabel}>Powered by:</span>
              {TECH_STACK.map((tech) => (
                <span key={tech.label} className={styles.techChip} style={{borderColor: tech.color}}>
                  {tech.label}
                </span>
              ))}
            </div>

            <div className={styles.buttons}>
              <Link
                className={clsx('button button--primary button--lg', styles.glowButton)}
                to="/docs/intro">
                Start Learning →
              </Link>
              <Link
                className={clsx('button button--secondary button--lg', styles.outlineButton)}
                to="https://github.com/your-repo">
                GitHub Repo
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Chatbot / Visuals */}
          <div className={styles.visualCol}>
            <div className={styles.glassCard}>
              <div className={styles.cardHeader}>
                <span className={styles.dotRed}></span>
                <span className={styles.dotYellow}></span>
                <span className={styles.dotGreen}></span>
                <span className={styles.cardTitle}>AI_Assistant.exe</span>
              </div>
              <div className={styles.chatbotWrapper}>
                
              </div>
            </div>
          </div>
            <AIAssistantWidget />
        </div>
        
        {/* Scroll Down Indicator */}
        <div className={styles.scrollIndicator}>
          <span>Start a Journey</span>
          <div className={styles.arrowDown}></div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="Embodied intelligence, ROS 2, Gazebo, NVIDIA Isaac, and humanoid robotics course.">
      <HomepageHeader />
      <main>
        {/* You can add HomepageFeatures here if you want them below the fold */}
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
