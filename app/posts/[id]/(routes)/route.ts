import { generateDummyParams } from '../../../config/export-helper';

export function generateStaticParams() {
  return generateDummyParams();
}

// This is a workaround file for static export
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/posts/${params.id}`,
    },
  });
} 