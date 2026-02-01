import React, { useState, useCallback } from 'react'
import { Upload, Button, Card, Space, Typography, Image, message } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const { Title, Text } = Typography

const ImageCrop = () => {
  const [src, setSrc] = useState(null)
  const [image, setImage] = useState(null)
  const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: 16 / 9 })
  const [croppedImageUrl, setCroppedImageUrl] = useState(null)
  const [completedCrop, setCompletedCrop] = useState(null)

  const onSelectFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setSrc(reader.result)
      })
      reader.readAsDataURL(file)
      return false
    }
    return false
  }

  const onImageLoaded = useCallback((img) => {
    setImage(img)
  }, [])

  const onCropComplete = useCallback((crop) => {
    setCompletedCrop(crop)
  }, [])

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
  }

  const handleCrop = async () => {
    if (!image || !completedCrop) {
      message.warning('请先选择图片并设置裁剪区域')
      return
    }

    try {
      const croppedImage = await getCroppedImg(image, completedCrop)
      const url = URL.createObjectURL(croppedImage)
      setCroppedImageUrl(url)
      message.success('图片裁剪成功！')
    } catch (error) {
      message.error('图片裁剪失败：' + error.message)
    }
  }

  const handleDownload = () => {
    if (croppedImageUrl) {
      const a = document.createElement('a')
      a.href = croppedImageUrl
      a.download = 'cropped_image.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>图片裁剪</Title>
        <Text type="secondary">自由裁剪图片尺寸和区域</Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>上传图片：</Text>
          <Upload
            beforeUpload={onSelectFile}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
        </Space>

        {src && (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>拖动选择裁剪区域：</Text>
              <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                <ReactCrop
                  src={src}
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={onCropComplete}
                  onImageLoaded={onImageLoaded}
                  style={{ maxWidth: '100%' }}
                />
              </div>
            </Space>

            <Button
              type="primary"
              onClick={handleCrop}
              block
              size="large"
            >
              确认裁剪
            </Button>

            {croppedImageUrl && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>裁剪结果预览</Title>
                <Image src={croppedImageUrl} alt="裁剪后" style={{ maxWidth: '100%' }} />
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  block
                  size="large"
                >
                  下载裁剪后的图片
                </Button>
              </Space>
            )}
          </>
        )}
      </Space>
    </Card>
  )
}

export default ImageCrop

