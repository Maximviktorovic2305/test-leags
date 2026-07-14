import { Mountain, Sparkles, Trophy } from "lucide-react";
import { LoginForm } from "@/features/auth-by-nickname";
import { Card, Typography } from "@/shared/ui";
import { leagueBenefits } from "../data/league-benefits";
import styles from "./styles.module.css";

export function LoginPanel() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <Mountain aria-hidden size={26} />
          </span>
          <Typography variant="label">Climb League</Typography>
        </div>

        <div className={styles.heroCopy}>
          <Typography variant="caption" tone="primary">
            Сезон открыт
          </Typography>
          <Typography variant="display">Каждая трасса меняет расклад.</Typography>
          <Typography className={styles.lead} tone="muted">
            Проходите маршруты, набирайте очки и поднимайтесь из Зелёной лиги в
            Синюю.
          </Typography>
        </div>

        <div className={styles.benefits}>
          {leagueBenefits.map((item) => (
            <div className={styles.benefit} key={item.label}>
              <Typography variant="h2">{item.value}</Typography>
              <Typography variant="small" tone="muted">
                {item.label}
              </Typography>
            </div>
          ))}
        </div>

        <div className={styles.promo}>
          <span className={styles.promoIcon}>
            <Trophy aria-hidden size={20} />
          </span>
          <div>
            <Typography variant="label">До топ‑3 — одна сильная трасса</Typography>
            <Typography variant="small" tone="muted">
              Тестовый рейтинг настроен для быстрого рывка.
            </Typography>
          </div>
          <Sparkles aria-hidden className={styles.sparkle} size={18} />
        </div>
      </section>

      <section className={styles.loginSide}>
        <Card className={styles.loginCard}>
          <LoginForm />
        </Card>
      </section>
    </main>
  );
}
