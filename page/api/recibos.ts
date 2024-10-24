// pages/api/recibos.ts
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const RECIBOS_FILE = path.join(process.cwd(), 'data', 'recibos.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const recibos = JSON.parse(fs.readFileSync(RECIBOS_FILE, 'utf8'))
      res.status(200).json(recibos)
    } catch (error) {
      res.status(500).json({ message: 'Error reading recibos' })
    }
  } else if (req.method === 'POST') {
    try {
      fs.writeFileSync(RECIBOS_FILE, JSON.stringify(req.body))
      res.status(200).json({ message: 'Recibos saved successfully' })
    } catch (error) {
      res.status(500).json({ message: 'Error saving recibos' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}