const Profile = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="rounded-xl bg-muted/50 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Roger Curtis</h1>
          <span className="text-muted-foreground">Patient ID: 208898786</span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm text-muted-foreground">Date of Birth</h3>
            <p>15th March 1988</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Contact</h3>
            <p>(555) 123-4567</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Emergency Contact</h3>
            <p>Jane Curtis • (555) 765-4321</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Primary Care</h3>
            <p>Dr. Emily Smith</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Insurance</h3>
            <p>HealthCare Plus • PPO 2345</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Last Login</h3>
            <p>2 hours ago</p>
          </div>
        </div>

        {/* FHIR Consent Section */}
        <div className="mt-6 border-t pt-6">
          <h2 className="mb-4 text-xl font-semibold">Data Sharing Consent</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Share with Research Institutions</span>
              <button className="rounded-lg border px-3 py-1">Manage</button>
            </div>
            <div className="flex items-center justify-between">
              <span>Emergency Access</span>
              <button className="rounded-lg border px-3 py-1">Configure</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
