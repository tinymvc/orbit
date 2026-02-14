import { Link } from "@inertiajs/react";

export default function ({ name, age }) {
  return (
    <div>
      <h1>About</h1>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <Link href="/">Go back home</Link>
    </div>
  );
}
