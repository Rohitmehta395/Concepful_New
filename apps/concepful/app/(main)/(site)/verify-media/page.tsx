import Image from 'next/image';

export default function VerifyMediaPage() {
  const bucketName = process.env.GCS_BUCKET || '<your-bucket-name>';
  const testImageUrl = `https://storage.googleapis.com/${bucketName}/test-image.jpg`;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Media Verification Page (Phase 5)</h1>
      <p className="mb-4 text-gray-600">
        This page verifies that <code>next/image</code> can render GCS-hosted files without remotePattern errors.
        Once an image is uploaded via Payload admin, replace <code>test-image.jpg</code> with the actual filename.
      </p>
      
      <div className="border border-dashed border-gray-300 p-10 rounded-lg flex flex-col items-center justify-center">
        <p className="mb-4 text-sm text-gray-500">Attempting to render: {testImageUrl}</p>
        <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded overflow-hidden">
          {/* We will test this by replacing the src or verifying it doesn't throw a remotePattern error */}
          <Image 
            src={testImageUrl} 
            alt="Test Image for Verification" 
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
