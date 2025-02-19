const Reports = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        {/* Lab Results */}
        <div className="rounded-xl bg-muted/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Lab Results</h2>
            <div className="flex gap-2">
              <button className="text-primary">Filter</button>
              <button className="text-primary">Sort</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3>Complete Blood Count</h3>
              <p className="text-sm text-muted-foreground">
                15th March 2024 • PDF
              </p>
            </div>
            <div className="border-b pb-2">
              <h3>Lipid Panel</h3>
              <p className="text-sm text-muted-foreground">
                1st March 2024 • PDF
              </p>
            </div>
          </div>
        </div>

        {/* Imaging Reports */}
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Imaging Reports</h2>
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3>Chest X-Ray</h3>
              <p className="text-sm text-muted-foreground">
                20th February 2024 • DICOM
              </p>
            </div>
            <div className="border-b pb-2">
              <h3>Abdominal Ultrasound</h3>
              <p className="text-sm text-muted-foreground">
                5th February 2024 • DICOM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
