function ErrorFormMsg(message: any | undefined) {
  return (
    <div
      className="bg-transparent text-red-500 mb-1 rounded relative"
      role="alert"
    >
      <strong style={{ fontSize: "12px" }}>{message}</strong>
    </div>
  );
}

function ErrorTemplateMsg(message: any | undefined) {
  return (
    <p
      className="bg-transparent text-red-500 mb-1 rounded relative"
      role="alert"
    >
      <strong style={{ fontSize: "12px" }}>{message}</strong>
    </p>
  );
}

export { ErrorFormMsg, ErrorTemplateMsg };
