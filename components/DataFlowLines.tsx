export default function DataFlowLines() {
  return (
    <div className="data-flow-lines">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="data-flow-line">
          <div className="data-flow-dot" />
        </div>
      ))}
    </div>
  );
}
