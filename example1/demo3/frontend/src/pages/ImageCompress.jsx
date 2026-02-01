import React, { useState } from 'react'
import { Upload, Button, Slider, Card, Space, Typography, Image, message } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import imageCompression from 'browser-image-compression'

const { Title, Text } = Typography

const ImageCompress = () => {
  const [originalFile, setOriginalFile] = useState(null)
  const [compressedFile, setCompressedFile] = useState(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [quality, setQuality] = useState(0.8)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [compressedUrl, setCompressedUrl] = useState(null)

  const handleFileChange = (file) => {
    if (!file) return false

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)

    setOriginalFile(file)
    setOriginalSize(file.size)
    setCompressedFile(null)
    setCompressedUrl(null)
    return false
  }

  const handleCompress = async () => {
    if (!originalFile) {
      message.warning('请先选择图片')
      return
    }

    setLoading(true)
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: originalFile.type,
        initialQuality: quality
      }

      const compressed = await imageCompression(originalFile, options)
      setCompressedFile(compressed)
      setCompressedSize(compressed.size)

      const reader = new FileReader()
      reader.onload = (e) => {
        setCompressedUrl(e.target.result)
      }
      reader.readAsDataURL(compressed)

      const reduction = ((1 - compressed.size / originalSize) * 100).toFixed(2)
      message.success(`压缩完成！文件大小减少 ${reduction}%`)
    } catch (error) {
      message.error('图片压缩失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (compressedFile) {
      const url = URL.createObjectURL(compressedFile)
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed_${originalFile.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>图片压缩</Title>
        <Text type="secondary">在线压缩图片，减小文件大小，保持图片质量</Text>

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

        {previewUrl && (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>压缩质量：</Text>
              <Slider
                min={0.1}
                max={1}
                step={0.1}
                value={quality}
                onChange={setQuality}
                marks={{
                  0.1: '10%',
                  0.5: '50%',
                  1: '100%'
                }}
              />
            </Space>

            <Button
              type="primary"
              onClick={handleCompress}
              loading={loading}
              block
              size="large"
            >
              开始压缩
            </Button>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>原图预览</Title>
              <Image src={previewUrl} alt="原图" style={{ maxWidth: '100%' }} />
              <Text>文件大小：{formatFileSize(originalSize)}</Text>
            </Space>

            {compressedUrl && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>压缩后预览</Title>
                <Image src={compressedUrl} alt="压缩后" style={{ maxWidth: '100%' }} />
                <Text>文件大小：{formatFileSize(compressedSize)}</Text>
                <Text type="success">
                  压缩率：{((1 - compressedSize / originalSize) * 100).toFixed(2)}%
                </Text>
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  block
                  size="large"
                >
                  下载压缩后的图片
                </Button>
              </Space>
            )}
          </>
        )}
      </Space>
    </Card>
  )
}

export default ImageCompress

