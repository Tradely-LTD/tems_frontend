export default function DashboardHome() {
  return (
    <div className="max-w-[640px] mx-auto mt-16">
      <div className="bg-white border border-[#c5c6d2] rounded-xl p-10 text-center">
        <h2 className="text-[22px] font-bold text-[#1a1b20] mb-2">Role not recognised</h2>
        <p className="text-[14px] text-[#444650] leading-relaxed">
          Your account role could not be matched to a dashboard. Please contact your administrator.
        </p>
      </div>
    </div>
  );
}
