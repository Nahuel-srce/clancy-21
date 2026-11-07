export default function Ending({ onReplay }) {
  const tape = Array(8).fill("CLANCY // 21 // CLANCY // 21 // ").join("");
  return (
    <div className="end">
      <div className="big21">21</div>
      <div className="in">
        <div className="felices">FELICES</div>
        <h1 className="t21 gl" data-t="Twenty one Years">
          Twenty one Years
        </h1>
        <p className="cta">¿QUÉ HABRÁ EN LA CAJA?</p>
      </div>
      <div className="cinta">
        <span>{tape}</span>
      </div>
      <button className="replay" onClick={onReplay}>
        ↺ replay
      </button>
    </div>
  );
}
