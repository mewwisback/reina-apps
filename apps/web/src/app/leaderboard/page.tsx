import Link from 'next/link';
import {AppShell} from '../../components/layout/app-shell';

export default function LeaderboardPage(){
 return <AppShell><div className="destination-page standings-page"><header><p className="destination-kicker">LEADERBOARD / RANKED OFFLINE</p><h1>Leaderboard</h1><p className="lead">Ranked results are not connected.</p></header><section className="standings-stage" aria-label="Ranked availability"><div className="standings-emblem" aria-hidden="true">R</div><div><p className="destination-kicker">NO ACTIVE LADDER</p><h2>Ranked unavailable</h2><p>This build has no live season, verified players or ranking history. Arena demo results do not award MMR or enter a leaderboard.</p><Link className="destination-action" href="/arena">Play a demo duel ↗</Link></div></section><footer className="standings-footer"><div><h2>Practice deck</h2><p>Practice with your saved local deck. Changes apply to your next accepted duel, not one already in progress.</p></div><Link href="/deck-builder">Open Deck Builder ↗</Link></footer></div></AppShell>;
}
