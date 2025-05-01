'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Textarea,
  useToast,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  HStack,
  Input,
} from '@chakra-ui/react'

interface Post {
  id: number
  title: string
  content: string
  author: string
  created_at: string
  comments: Comment[]
}

interface Comment {
  id: number
  content: string
  author: string
  created_at: string
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newComment, setNewComment] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost/api/posts.php')
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch posts',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost/api/posts.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Post created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setNewPostTitle('')
        setNewPostContent('')
        fetchPosts()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleAddComment = async (postId: number) => {
    try {
      const response = await fetch('http://localhost/api/comments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          content: newComment,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Comment added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setNewComment('')
        fetchPosts()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Dashboard</Heading>
        
        {/* Create Post Form */}
        <Card>
          <CardHeader>
            <Heading size="md">Create New Post</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreatePost}>
              <VStack spacing={4}>
                <Input
                  placeholder="Title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Share your experience..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <Button type="submit" colorScheme="blue">
                  Post
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Posts List */}
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <Heading size="md">{post.title}</Heading>
              <Text fontSize="sm" color="gray.500">
                By {post.author} on {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </CardHeader>
            <CardBody>
              <Text>{post.content}</Text>
            </CardBody>
            <CardFooter>
              <VStack align="stretch" width="100%">
                <HStack>
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button
                    colorScheme="blue"
                    onClick={() => handleAddComment(post.id)}
                  >
                    Comment
                  </Button>
                </HStack>
                {post.comments?.map((comment) => (
                  <Box key={comment.id} pl={4} borderLeft="2px solid" borderColor="gray.200">
                    <Text fontSize="sm" color="gray.500">
                      {comment.author} on {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                    <Text>{comment.content}</Text>
                  </Box>
                ))}
              </VStack>
            </CardFooter>
          </Card>
        ))}
      </VStack>
    </Box>
  )
} 