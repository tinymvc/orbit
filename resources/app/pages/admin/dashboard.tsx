export default function ({ auth }: { auth: any }) {
  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome back, {auth.user?.display_name}!</p>
    </div>
  );
}
