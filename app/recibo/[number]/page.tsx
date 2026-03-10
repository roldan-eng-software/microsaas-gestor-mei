import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function ReciboPage({
  params,
}: {
  params: { number: string }
}) {
  const receipt = await prisma.receipt.findUnique({
    where: { number: params.number },
  })

  if (!receipt || !receipt.isPublic) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">RECIBO</h1>
          <p className="text-gray-600">Número: {receipt.number}</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data</h3>
              <p className="text-gray-800">
                {new Date(receipt.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor</h3>
              <p className="text-gray-800 font-bold text-lg">
                R$ {receipt.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
            <p className="text-gray-800">{receipt.description}</p>
          </div>

          {receipt.clientName && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
              <p className="text-gray-800">{receipt.clientName}</p>
              {receipt.clientEmail && (
                <p className="text-gray-600 text-sm">{receipt.clientEmail}</p>
              )}
              {receipt.clientPhone && (
                <p className="text-gray-600 text-sm">{receipt.clientPhone}</p>
              )}
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Emitido por</h3>
            <p className="text-gray-800">{receipt.issuerName || 'MEI'}</p>
            {receipt.issuerEmail && (
              <p className="text-gray-600 text-sm">{receipt.issuerEmail}</p>
            )}
          </div>

          <div className="text-center pt-6 border-t">
            <p className="text-gray-500 text-sm">
              Este recibo foi gerado automaticamente pelo Gestor MEI
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}