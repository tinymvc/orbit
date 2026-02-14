import { Link } from "@inertiajs/react";

export default function () {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the home page!</p>
      <Link href="/about">Go to About</Link>
    </div>
  );
}
