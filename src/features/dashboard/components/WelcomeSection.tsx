import { Fade } from '@/components/motion';
import { Card } from '@/components/ui/Card';

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeSection({ nickname }: { nickname: string }) {
  const greeting = getGreeting(new Date().getHours());
  return (
    <Fade duration="normal">
      <Card variant="highlighted" className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">Your academic workspace</p>
          <h1>{greeting}, {nickname}</h1>
          <p>Stay focused on what matters today. Your Syllora overview will grow as you add academic and productivity data.</p>
        </div>
      </Card>
    </Fade>
  );
}
