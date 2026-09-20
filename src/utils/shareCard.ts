import type { ArtistDetail, ArtistScore } from './types'
import { colorFor, initialOf } from './score'

const WIDTH = 1080
const HEIGHT = 1920

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()

    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// Draws the same fan score breakdown shown on screen onto a story-sized
// canvas, so it can be shared or downloaded as a single image
export const generateShareCard = async (
  artist: ArtistDetail,
  score: ArtistScore,
  totalArtists: number,
  imageUrl?: string
): Promise<Blob> => {
  await document.fonts.ready

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  bg.addColorStop(0, '#100b1c')
  bg.addColorStop(1, '#1a1428')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.save()
  ctx.filter = 'blur(70px)'
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#29e07a'
  ctx.beginPath()
  ctx.arc(120, 60, 260, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ff5fa2'
  ctx.beginPath()
  ctx.arc(WIDTH - 120, 220, 220, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const avatarSize = 300
  const avatarX = WIDTH / 2
  const avatarY = 420

  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  let drewPhoto = false

  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl)
      ctx.drawImage(img, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
      drewPhoto = true
    } catch {
      drewPhoto = false
    }
  }

  if (!drewPhoto) {
    ctx.fillStyle = colorFor(artist.artist)
    ctx.fillRect(avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
  }

  ctx.restore()

  if (!drewPhoto) {
    ctx.fillStyle = '#100b1c'
    ctx.font = '700 120px Fredoka, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initialOf(artist.artist), avatarX, avatarY + 12)
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#f6f3fb'
  ctx.font = '600 70px Fredoka, sans-serif'
  ctx.fillText(artist.artist, WIDTH / 2, 640, WIDTH - 140)

  ctx.fillStyle = '#a89fc2'
  ctx.font = '500 34px "Plus Jakarta Sans", sans-serif'
  ctx.fillText(`#${artist.rank} of ${totalArtists} artists`, WIDTH / 2, 700)

  ctx.fillStyle = '#29e07a'
  ctx.font = '700 240px Fredoka, sans-serif'
  ctx.fillText(String(score.score), WIDTH / 2, 990)

  ctx.fillStyle = '#a89fc2'
  ctx.font = '600 34px "Plus Jakarta Sans", sans-serif'
  ctx.fillText('FAN SCORE / 100', WIDTH / 2, 1045)

  ctx.fillStyle = '#ff5fa2'
  ctx.font = '600 54px Fredoka, sans-serif'
  ctx.fillText(score.tier, WIDTH / 2, 1140)

  let barY = 1250
  const barX = 140
  const barW = WIDTH - 280

  for (const b of score.breakdown) {
    ctx.textAlign = 'left'
    ctx.fillStyle = '#f6f3fb'
    ctx.font = '500 32px "Plus Jakarta Sans", sans-serif'
    ctx.fillText(b.label, barX, barY)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#a89fc2'
    ctx.fillText(`${b.value}/${b.max}`, barX + barW, barY)

    ctx.fillStyle = '#362b4d'
    roundRect(ctx, barX, barY + 24, barW, 20, 10)
    ctx.fill()

    ctx.fillStyle = '#29e07a'
    roundRect(ctx, barX, barY + 24, barW * (b.value / b.max), 20, 10)
    ctx.fill()

    barY += 120
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#a89fc2'
  ctx.font = '500 30px "Plus Jakarta Sans", sans-serif'
  ctx.fillText('🎧 Encore — track your fan score', WIDTH / 2, HEIGHT - 80)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not generate image'))
    }, 'image/png')
  })
}
