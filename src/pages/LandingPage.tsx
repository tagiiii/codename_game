import React from 'react';
import { Button } from '../components';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onStartGame: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartGame }) => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Codenames Online</h1>
          <div className={styles.subtitle}>
            言葉の連想で味方にヒントを伝えよう！<br />
            チーム対戦型コミュニケーションゲーム
          </div>
          <div>
            <Button
              variant="primary"
              size="large"
              onClick={onStartGame}
              className={styles.ctaButton}
            >
              ゲームを始める
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>どんなゲーム？</h2>
        <p className={styles.aboutText}>
          2つのチームに分かれて、スパイマスターのヒントを元に、<br />
          自分たちのチームの「コードネーム（単語）」を全て見つけ出すゲームです。<br />
          ただし、相手チームの単語や、即座に負けとなる「暗殺者」には気をつけて！
        </p>
      </section>

      {/* Rules Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>遊び方</h2>
        <div className={styles.steps}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>チーム分け</h3>
            <p className={styles.stepDescription}>
              赤チームと青チームに分かれます。<br />
              各チームから1人ずつ「スパイマスター」を選出します。
            </p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>ヒントを出す</h3>
            <p className={styles.stepDescription}>
              スパイマスターは、自分のチームの単語に関連する<br />
              「単語（1語）」と「枚数」をヒントとして伝えます。
            </p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>正解を探す</h3>
            <p className={styles.stepDescription}>
              チームメンバーは相談して、<br />
              ヒントに当てはまるカードを選択します。
            </p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>勝利条件</h3>
            <p className={styles.stepDescription}>
              先に全ての正解カードを見つけたチームの勝利！<br />
              「暗殺者」を選んでしまうと即負けです。
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>さあ、始めよう！</h2>
        <Button
          variant="primary"
          size="large"
          onClick={onStartGame}
          className={styles.ctaButton}
        >
          今すぐプレイする
        </Button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Codenames Online</p>
      </footer>
    </div>
  );
};
