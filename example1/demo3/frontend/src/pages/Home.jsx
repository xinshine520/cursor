import React from 'react'
import { Card, Row, Col, Typography, Space } from 'antd'
import { FileTextOutlined, CompressOutlined, ScissorOutlined, 
         SwapOutlined, BgColorsOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      title: '文件转换',
      icon: <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      description: '支持多种文档格式转换',
      path: '/file-convert'
    },
    {
      title: '图片压缩',
      icon: <CompressOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      description: '在线压缩图片，减小文件大小',
      path: '/image-compress'
    },
    {
      title: '图片裁剪',
      icon: <ScissorOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      description: '自由裁剪图片尺寸',
      path: '/image-crop'
    },
    {
      title: '格式转换',
      icon: <SwapOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      description: '转换图片格式（JPG、PNG、WebP等）',
      path: '/image-format'
    },
    {
      title: '图片水印',
      icon: <BgColorsOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      description: '为图片添加文字或图片水印',
      path: '/image-watermark'
    }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={1}>文件与图片处理工具</Title>
          <Paragraph style={{ fontSize: 16 }}>
            提供文件转换、图片压缩、裁剪、格式转换和水印等功能
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
                onClick={() => navigate(feature.path)}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {feature.icon}
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph>{feature.description}</Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  )
}

export default Home

