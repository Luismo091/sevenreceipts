'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Trash2, Download, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import html2canvas from 'html2canvas'

interface Recibo {
  id: string
  fecha: string
  numero: string
  recibidoDe: string
  suma: string
  formaPago: string
  concepto: string
  saldo: string
}

export default function ReciboGenerator() {
  const [darkMode, setDarkMode] = useState(false)
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [filtro, setFiltro] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    // Fetch recibos from JSON file
    fetch('/api/recibos')
      .then(response => response.json())
      .then(data => setRecibos(data))
  }, [])

  const saveRecibos = (newRecibos: Recibo[]) => {
    // Save recibos to JSON file
    fetch('/api/recibos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRecibos),
    })
  }

  const generateReciboNumber = () => {
    const random = Math.floor(10000 + Math.random() * 90000)
    return `SANGL-2024-${random}`
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newRecibo: Recibo = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      numero: generateReciboNumber(),
      recibidoDe: formData.get('recibidoDe') as string,
      suma: formData.get('suma') as string,
      formaPago: formData.get('formaPago') as string,
      concepto: formData.get('concepto') as string,
      saldo: formData.get('saldo') as string,
    }
    const updatedRecibos = [...recibos, newRecibo]
    setRecibos(updatedRecibos)
    saveRecibos(updatedRecibos)
    toast({
      title: "Recibo generado",
      description: "El recibo ha sido creado y almacenado correctamente.",
    })
    e.currentTarget.reset()
  }

  const handleDelete = (id: string) => {
    const updatedRecibos = recibos.filter(recibo => recibo.id !== id)
    setRecibos(updatedRecibos)
    saveRecibos(updatedRecibos)
    toast({
      title: "Recibo eliminado",
      description: "El recibo ha sido eliminado correctamente.",
      variant: "destructive",
    })
  }

  const handleDownload = async (id: string) => {
    const reciboElement = document.getElementById(`recibo-${id}`)
    if (reciboElement) {
      const canvas = await html2canvas(reciboElement)
      const link = document.createElement('a')
      link.download = `recibo-${id}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const filteredRecibos = recibos.filter(recibo =>
    Object.values(recibo).some(value =>
      value.toLowerCase().includes(filtro.toLowerCase())
    )
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo Torneo Nacional de Futbol" className="mr-4 h-16" />
            <h1 className="text-3xl font-bold">Generador de Recibos - Copa Esfordag</h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div>
            <Label htmlFor="recibidoDe">Recibí de</Label>
            <Input type="text" id="recibidoDe" name="recibidoDe" required />
          </div>
          <div>
            <Label htmlFor="suma">La suma de</Label>
            <Input type="number" id="suma" name="suma" required />
          </div>
          <div>
            <Label htmlFor="formaPago">Forma de pago</Label>
            <Select name="formaPago" required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione forma de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="concepto">Por el concepto de</Label>
            <Input type="text" id="concepto" name="concepto" required />
          </div>
          <div>
            <Label htmlFor="saldo">Saldo</Label>
            <Input type="number" id="saldo" name="saldo" required />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Button type="submit" className="w-full">Generar Recibo</Button>
          </div>
        </form>

        <div className="mb-4">
          <Label htmlFor="filtro">Filtrar Recibos</Label>
          <div className="flex">
            <Input
              type="text"
              id="filtro"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar en recibos..."
              className="mr-2"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Recibido de</TableHead>
              <TableHead>Suma</TableHead>
              <TableHead>Forma de Pago</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecibos.map((recibo) => (
              <TableRow key={recibo.id}>
                <TableCell>{recibo.fecha}</TableCell>
                <TableCell>{recibo.numero}</TableCell>
                <TableCell>{recibo.recibidoDe}</TableCell>
                <TableCell>${recibo.suma}</TableCell>
                <TableCell>{recibo.formaPago}</TableCell>
                <TableCell>{recibo.concepto}</TableCell>
                <TableCell>${recibo.saldo}</TableCell>
                <TableCell>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(recibo.id)} className="mr-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDownload(recibo.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredRecibos.map((recibo) => (
          <div key={recibo.id} id={`recibo-${recibo.id}`} className="hidden">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-[21cm] mx-auto mt-8">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="Logo Torneo Nacional de Futbol" className="h-24" />
              </div>
              <div className="flex justify-between mb-4">
                <p><strong>Fecha:</strong> {recibo.fecha}</p>
                <p><strong>Recibo N.°:</strong> {recibo.numero}</p>
              </div>
              <div className="mb-4">
                <p><strong>Recibí de:</strong> {recibo.recibidoDe}</p>
              </div>
              <div className="mb-4">
                <p><strong>La suma de:</strong> ${recibo.suma}</p>
              </div>
              <div className="mb-4">
                <p><strong>Forma de pago:</strong> {recibo.formaPago}</p>
              </div>
              <div className="mb-4">
                <p><strong>Por el concepto de:</strong> {recibo.concepto}</p>
              </div>
              <div className="mb-4">
                <p><strong>Correspondiente a:</strong> Participación 7mo Torneo Copa Esfordag</p>
              </div>
              <div className="mb-8">
                <p><strong>Saldo:</strong> ${recibo.saldo}</p>
              </div>
              <div className="flex justify-center mb-4">
                <img src="/firma.png" alt="Firma" className="h-16" />
              </div>
              <div className="text-center text-sm">
                <p>CONTACTO: 3012096623</p>
                <p>albeiro17@hotmail.com</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}