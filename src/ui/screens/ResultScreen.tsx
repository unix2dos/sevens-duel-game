interface ResultScreenProps {
  title: string;
  onReplay: () => void;
}

export function ResultScreen({ title, onReplay }: ResultScreenProps) {
  return (
    <main className="game-layout">
      <section className="overlay-card result-card">
        <p className="eyebrow">RESULT</p>
        <h2>{title}</h2>
        <button className="primary-action" onClick={onReplay} type="button">
          再来一局
        </button>
      </section>
    </main>
  );
}
