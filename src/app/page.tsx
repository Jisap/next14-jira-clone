import { Button } from "@/components/ui/button";




export default function Home() {
  return (
    <div className="flex gap-4">
      <Button size="lg" variant="primary">Click me</Button>
      <Button size="sm" variant="destructive">Click me</Button>
      <Button size="xs" variant="ghost">Click me</Button>
      <Button size="default" variant="muted">Click me</Button>
      <Button size="sm" variant="outline">Click me</Button>
      <Button size="sm" variant="secondary">Click me</Button>
      <Button size="sm" variant="tertiary">Click me</Button>
    </div>
  );
}
