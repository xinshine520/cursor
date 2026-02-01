import React, { useState } from 'react'
import { Upload, Button, Select, Card, Space, Typography, Image, message } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select
const { Title, Text } = Typography

const ImageFormat = () => {
  const [fileList, setFileList] = useState([])
  const [targetFormat, setTargetFormat] = useState('png')
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [convertedUrl, setConvertedUrl] = useState(null)

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
      setFileList([{ uid: file.uid, name: file.name, originFileObj: file }])
      setConvertedUrl(null)
      return false
    }
    return false
  }

  const handleConvert = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择要转换的图片')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', fileList[0].originFileObj)
    formData.append('targetFormat', targetFormat)

    try {
      const response = await axios.post('/api/convert/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      })

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      setConvertedUrl(url)
      message.success('图片格式转换成功！')
    } catch (error) {
      message.error('图片格式转换失败：' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (convertedUrl) {
      const a = document.createElement('a')
      a.href = convertedUrl
      a.download = `converted.${targetFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>图片格式转换</Title>
        <Text type="secondary">支持将图片转换为不同格式（JPG、PNG、WebP等）</Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>选择目标格式：</Text>
          <Select
            value={targetFormat}
            onChange={setTargetFormat}
            style={{ width: '100%' }}
          >
            <Option value="png">PNG</Option>
            <Option value="jpg">JPG</Option>
            <Option value="webp">WebP</Option>
            <Option value="gif">GIF</Option>
            <Option value="bmp">BMP</Option>
          </Select>
        </Space>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>上传图片：</Text>
          <Upload
            fileList={fileList}
            beforeUpload={handleFileChange}
            onRemove={() => {
              setFileList([])
              setPreviewUrl(null)
              setConvertedUrl(null)
            }}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
        </Space>

        {previewUrl && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>原图预览</Title>
            <Image src={previewUrl} alt="原图" style={{ maxWidth: '100%' }} />
          </Space>
        )}

        <Button
          type="primary"
          onClick={handleConvert}
          loading={loading}
          block
          size="large"
        >
          开始转换
        </Button>

        {convertedUrl && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>转换后预览</Title>
            <Image src={convertedUrl} alt="转换后" style={{ maxWidth: '100%' }} />
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              block
              size="large"
            >
              下载转换后的图片
            </Button>
          </Space>
        )}
      </Space>
    </Card>
  )
}

export default ImageFormat

