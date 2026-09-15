import { describe, expect, it } from 'vitest'
import { parseReceipt } from './receipt.parse'

describe('parseReceipt', () => {
  it('reads a supermarket receipt: known merchant and TOTAL TTC, ignoring sub-total and VAT', () => {
    const text = `CARREFOUR MARKET
12 RUE DE LA REPUBLIQUE
69002 LYON
LAIT DEMI ECREME 1,15
CAFE MOULU 250G 4,20
SOUS-TOTAL 11,14
TVA 5,5% 0,58
TOTAL TTC 11,14 EUR
CB 11,14
RENDU 0,00
15/09/2026 11:42 CAISSE 3`
    expect(parseReceipt(text)).toEqual({ label: 'Carrefour Market', amount: 1114 })
  })

  it('prefers "net à payer" over an earlier bigger total before discount', () => {
    const text = `Boulangerie Au Bon Pain
Total 25,80
Remise fidélité -3,00
Net à payer 22,80 €`
    expect(parseReceipt(text)).toEqual({ label: 'Boulangerie Au Bon Pain', amount: 2280 })
  })

  it('reads an invoice where the amount is on the line below its label and uses thousands separators', () => {
    const text = `FACTURE N° 2026-0412
Menuiserie Dupont & Fils
SIRET 123 456 789 00012
Montant HT 1 050,00 €
TVA 20 % 210,00 €
Total à payer
1 260,00 €`
    expect(parseReceipt(text)).toEqual({ label: 'Menuiserie Dupont & Fils', amount: 126000 })
  })

  it('keeps the grand total when a receipt lists one total per VAT rate', () => {
    const text = `Le Petit Bistrot
TOTAL 5,5% 8,40
TOTAL 10% 31,50
TOTAL 39,90`
    expect(parseReceipt(text).amount).toBe(3990)
  })

  it('repairs common OCR confusions inside amounts', () => {
    const text = `STATION ESSO
Gazole 42,1O L
TOTAL 7O,5O EUR`
    expect(parseReceipt(text)).toEqual({ label: 'Esso', amount: 7050 })
  })

  it('handles the 12€50 notation and whole amounts with a currency', () => {
    expect(parseReceipt('Cinéma Pathé\nPlace adulte 12€50').amount).toBe(1250)
    expect(parseReceipt('Club de sport Energy\nCotisation mensuelle : 45 €').amount).toBe(4500)
  })

  it('finds the merchant anywhere in the document, e.g. a PDF bill', () => {
    const text = `Votre facture du mois de septembre
Client : Camille Martin
Référence contrat 00012345
Offre Heures Creuses
Montant TTC 87,32 €
EDF - Électricité de France`
    expect(parseReceipt(text)).toEqual({ label: 'EDF', amount: 8732 })
  })

  it('does not take everyday words such as "Total" for a merchant name', () => {
    const text = `TOTAL 12,00\nCB 12,00`
    expect(parseReceipt(text).label).toBeNull()
  })

  it('returns nulls when the document has nothing usable', () => {
    expect(parseReceipt('')).toEqual({ label: null, amount: null })
    expect(parseReceipt('12/09/2026 14:05\n0612345678')).toEqual({ label: null, amount: null })
  })

  it('does not mistake dates, phone numbers or quantities for the total', () => {
    const text = `Pharmacie du Centre
Tél 04 78 12 34 56
15/09/2026
Doliprane x2
Montant 6,84`
    expect(parseReceipt(text)).toEqual({ label: 'Pharmacie du Centre', amount: 684 })
  })
})
