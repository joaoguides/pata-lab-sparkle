export function Card(props: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${props.className || ""}`}>{props.children}</div>;
}

export function CardHeader(props: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${props.className || ""}`}>{props.children}</div>;
}

export function CardContent(props: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 pt-0 ${props.className || ""}`}>{props.children}</div>;
}

export function CardFooter(props: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center p-6 pt-0 ${props.className || ""}`}>{props.children}</div>;
}

export function CardTitle(props: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${props.className || ""}`}>{props.children}</h3>;
}

export function CardDescription(props: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-muted-foreground ${props.className || ""}`}>{props.children}</p>;
}
