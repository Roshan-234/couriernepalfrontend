import { useQuery } from 'react-query';
import api from '@/lib/api';
// import ShipmentList from '@/components/dashboard/ShipmentList';
// import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ShipmentsPage() {
  const router = useRouter();
  const { data: shipments, isLoading } = useQuery('shipments', () =>
    api.get('/shipments').then(res => res.data)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Shipments</h1>
        {/* <Button onClick={() => router.push('/dashboard/create-shipment')}>
          Create New Shipment
        </Button> */}
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        // <ShipmentList shipments={shipments} />
        ""
      )}
    </div>
  );
}