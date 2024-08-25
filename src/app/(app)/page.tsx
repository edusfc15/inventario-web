import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from './components/header'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductTableRow } from './components/product-table-row'
import { ProductDTO } from '../dtos/productDTO'
import { api } from '@/services/api'
import { queryClient } from '@/lib/queryClient'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { CreateProductButton } from '@/components/app/create-product-button'

export async function getProducts() {
  const response = await api('/product', {
    method: 'GET',
  })

  const products: ProductDTO[] = await response.json()

  return products
}

export default async function ProductsPage() {
  const session = await auth()
  // const products = await getProducts()

  if (!session) {
    redirect('/auth')
  }

  await queryClient.prefetchQuery({
    queryKey: ['product'],
    queryFn: getProducts,
  })
  const dehydratedState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="h-screen bg-black mx-auto max-w-7xl">
        <Header session={session} />

        <div className="flex justify-between items-center">
          <h1 className="my-6 font-semibold text-xl">Products</h1>
          <CreateProductButton />
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader className="h-16">
              <TableRow>
                <TableHead />
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço unitário</TableHead>
                <TableHead className="text-center">
                  Estoque (unidades)
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryClient
                .getQueryData<ProductDTO[]>(['product'])
                ?.map((product) => (
                  <ProductTableRow key={product.id} product={product} />
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </HydrationBoundary>
  )
}
