const ShipmentStatus = ({ steps }: { steps: Array<{ status: string, location: string, timestamp: string, completed: boolean }> }) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" style={{ marginLeft: '28px' }}></div>

      <div className="space-y-8 pl-16">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Icon */}
            <div className={`absolute -left-14 w-12 h-12 rounded-full flex items-center justify-center ${
              step.completed ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {step.completed ? (
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-4 h-4 bg-white rounded-full"></div>
              )}
            </div>
            
            {/* Content */}
            <div className={`p-4 rounded-lg ${
              step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex justify-between">
                <h3 className="font-bold">{step.status}</h3>
                <span className="text-gray-500">{step.timestamp}</span>
              </div>
              <p className="mt-1">{step.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipmentStatus;