export default async function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="flex items-center justify-center aspect-video rounded-xl bg-green-200">
          1
        </div>
        <div className="flex items-center justify-center aspect-video rounded-xl bg-green-200">
          2
        </div>
        <div className="flex items-center justify-center aspect-video rounded-xl bg-green-200">
          3
        </div>
      </div>
      <div className="flex justify-center items-center min-h-[100vh] flex-1 rounded-xl bg-green-200 md:min-h-min">
        4
      </div>
    </div>
  );
}
