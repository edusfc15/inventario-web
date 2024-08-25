'use client'

import React from 'react'
import { DialogContent, DialogTitle } from '../ui/dialog'
import { Table, TableBody, TableCell, TableRow } from '../ui/table'
import { DetailsButtonProps } from './details-button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useMaskito } from '@maskito/react'
import BRLmask from '@/masks/BRLmask'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { formatPrice } from '@/utils/formatPrice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { api } from '@/services/api'
import { CategoryDTO } from '@/app/dtos/categoryDTO'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface ProductDetailsProps extends DetailsButtonProps {}

const schema = z.object({
  description: z.string().min(1, 'Insira uma descrição'),
  unitPrice: z.string().min(1, 'Valor da unidade é obrigatório'),
  quantity: z
    .number({ message: 'Digite apenas números' })
    .min(0, 'Quantidade deve ser um número positivo'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
})

type FormValues = z.infer<typeof schema>

type FormDataType = Omit<FormValues, 'unitPrice'> & {
  unitPrice: number
}

async function getCategories() {
  const response = await api('/category')
  const categories: CategoryDTO[] = await response.json()
  return categories
}

async function updateProduct(productId: string, data: FormDataType) {
  const response = await api(`/product/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to update product')
  }
  return response.json()
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: FormDataType) => updateProduct(product.id, data),
    onSuccess: () => {
      console.log('Product updated')

      queryClient.invalidateQueries({ queryKey: ['product'] })
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      description: product.description,
      unitPrice: formatPrice(product.price),
      quantity: product.quantity_in_stock,
      categoryId: product.category?.id || '',
    },
    resolver: zodResolver(schema),
  })

  const maskedInputRef = useMaskito({ options: BRLmask })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const unitPriceNumber = parseFloat(
      data.unitPrice.replace('R$', '').replace(',', '.'),
    )
    const submissionData: FormDataType = {
      ...data,
      unitPrice: unitPriceNumber,
    }

    // console.log(submissionData)

    mutation.mutate(submissionData)
  }

  return (
    <DialogContent>
      <DialogTitle>{product.name}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Descrição do produto"
                className="resize-none"
              />
            )}
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>
        <Table>
          <TableBody>
            <TableRow className="flex items-center justify-between">
              <TableCell className="flex-1 relative">Category</TableCell>
              <TableCell className="flex flex-col gap-2 items-end">
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(selectedId) => {
                        field.onChange(selectedId)
                      }}
                    >
                      <SelectTrigger className="w-fit">
                        <SelectValue placeholder="Selecione a categoria">
                          {categories?.find(
                            (category) => category.id === field.value,
                          )?.name || 'Selecione uma categoria'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-red-500">{errors.categoryId.message}</p>
                )}
              </TableCell>
            </TableRow>
            <TableRow className="flex items-center justify-between">
              <TableCell className="flex-1">Unit price</TableCell>
              <TableCell className="flex flex-col gap-2 items-end">
                <Controller
                  name="unitPrice"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      ref={maskedInputRef}
                      className="w-fit"
                      onInput={(e) =>
                        setValue('unitPrice', e.currentTarget.value)
                      }
                    />
                  )}
                />
                {errors.unitPrice && (
                  <p className="text-red-500">{errors.unitPrice.message}</p>
                )}
              </TableCell>
            </TableRow>
            <TableRow className="flex items-center justify-between">
              <TableCell className="flex-1">Quantity in stock</TableCell>
              <TableCell className="flex flex-col gap-2 items-end">
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      className="w-fit"
                      onChange={(e) => {
                        const value = e.currentTarget.value
                        setValue('quantity', parseFloat(value))
                      }}
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-red-500">{errors.quantity.message}</p>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Button className="w-full mt-4" type="submit">
          Salvar
        </Button>
      </form>
    </DialogContent>
  )
}
