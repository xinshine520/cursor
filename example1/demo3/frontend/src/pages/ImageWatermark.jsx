import React, { useState, useRef, useEffect } from 'react'
import { Upload, Button, Input, Card, Space, Typography, Image, message, Slider } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { fabric } from 'fabric'

const { Title, Text } = Typography
const { TextArea } = Input

const ImageWatermark = () => {
  const [imageUrl, setImageUrl] = useState(null)
  const [watermarkText, setWatermarkText] = useState('水印文字')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(0.5)
  const canvasRef = useRef(null)
  const fabricCanvasRef = useRef(null)

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600
      })
      fabricCanvasRef.current = canvas

      fabric.Image.fromURL(imageUrl, (img) => {
        const scale = Math.min(800 / img.width, 600 / img.height)
        img.scale(scale)
        canvas.setWidth(img.width * scale)
        canvas.setHeight(img.height * scale)
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
        canvas.renderAll()
      })

      return () => {
        canvas.dispose()
      }
    }
  }, [imageUrl])

  useEffect(() => {
    if (fabricCanvasRef.current && watermarkText) {
      const canvas = fabricCanvasRef.current
      canvas.remove(...canvas.getObjects().filter(obj => obj.type === 'text'))

      const text = new fabric.Text(watermarkText, {
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
        fontSize: fontSize,
        fill: `rgba(255, 255, 255, ${opacity})`,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center'
      })

      canvas.add(text)
      canvas.renderAll()
    }
  }, [watermarkText, fontSize, opacity, imageUrl])

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target.result)
      }
      reader.readAsDataURL(file)
      return false
    }
    return false
  }

  const handleDownload = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      })
      const a = document.createElement('a')
      a.href = dataURL
      a.download = 'watermarked_image.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      message.success('图片下载成功！')
    }
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>图片水印</Title>
        <Text type="secondary">为图片添加文字水印</Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>上传图片：</Text>
          <Upload
            beforeUpload={handleFileChange}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
        </Space>

        {imageUrl && (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>水印文字：</Text>
              <TextArea
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                rows={2}
                placeholder="请输入水印文字"
              />
            </Space>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>字体大小：{fontSize}px</Text>
              <Slider
                min={12}
                max={100}
                value={fontSize}
                onChange={setFontSize}
              />
            </Space>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>透明度：{(opacity * 100).toFixed(0)}%</Text>
              <Slider
                min={0.1}
                max={1}
                step={0.1}
                value={opacity}
                onChange={setOpacity}
              />
            </Space>

            <div style={{ textAlign: 'center', border: '1px solid #d9d9d9', padding: '20px' }}>
              <canvas ref={canvasRef}></canvas>
            </div>

            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              block
              size="large"
            >
              下载带水印的图片
            </Button>
          </>
        )}
      </Space>
    </Card>
  )
}

export default ImageWatermark

