export default function Intro({ cover, onStart }) {
  return (
    <div className="intro">
      {cover && (
        <img
          className="icov"
          src={cover}
          alt=""
          onError={(e) => e.currentTarget.remove()}
        />
      )}
      <div className="itx">
        <p className="mono">08 // 12 // 26</p>
        <h1 className="gl" data-t="INCOMING TRANSMISSION">
          EMPEZANDO TRANSMISIÓN
        </h1>
        <button className="go" onClick={onStart}>
          ENTRAR
        </button>
        <p className="mono dim">CLANCY // TWENTY ONE PILOTS</p>
      </div>
    </div>
  );
}
