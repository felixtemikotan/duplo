const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
import fastify from 'fastify';
import {nanoid} from 'nanoid';
const routes = require("../api/index");

const prisma = new PrismaClient();
const apiUrl = 'http://localhost:5000';

const app = fastify({
    logger: true
  });
const start = async () => {
    try {
      await app.listen({ port: 5000 });
      console.log('Server is running on port 5000');
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  
  const close_x = async () => {
    await app.close();
    await prisma.$disconnect();
    console.log('Server closed successfully');
  };
beforeAll(async () => {
  await start();
});

afterAll(async () => {
  await close_x();
  await prisma.$disconnect();
});

describe('Blog API End-to-End Tests', () => {
    routes.forEach((route:any, index:any) => {
        app.route(route)
    });
    test('Add new blog post', async () => {
      const response = await axios.post(`${apiUrl}/api/add-blog-post`, {
        title: 'Test Post' + nanoid(10),
        content: 'This is a test post.',
        author: 'Test Author',
      });
  console.log(response.data)
      expect(response.status).toBe(201);
      expect(response.data.status).toBe(201);
      expect(response.data.message).toBe('Blog post added successfully');
    },15000);
  
    test('Get all blog posts', async () => {
      const response = await axios.get(`${apiUrl}/api/get-all-blog-posts`);
        console.log("Response",response.data)
      expect(response.status).toBe(200);
      expect(response.data.status).toBe(200);
      expect(response.data.message).toBe('All blog post retrieved successfully');
    },15000);
  
    test('Get single blog post', async () => {
      const allPostsResponse = await axios.get(`${apiUrl}/api/get-all-blog-posts`);
      const postId = allPostsResponse.data.data[0].id;
      const response = await axios.get(`${apiUrl}/api/get-single-blog-post/${postId}`);
  
      expect(response.status).toBe(200);
      expect(response.data.status).toBe(200);
      expect(response.data.message).toBe('Blog post retrieved successfully');
    },15000);
  
    test('Update blog post', async () => {
      const allPostsResponse = await axios.get(`${apiUrl}/api/get-all-blog-posts`);
      const postId = allPostsResponse.data.data[0].id;
  
      const response = await axios.post(`${apiUrl}/api/update-blog-post/${postId}`, {
        title: 'Updated Test Post'+ nanoid(10),
      });
  
      expect(response.status).toBe(200);
      expect(response.data.status).toBe(200);
      expect(response.data.message).toBe('Blog post updated successfully');
    },15000);
  
    test('Delete blog post', async () => {
      const allPostsResponse = await axios.get(`${apiUrl}/api/get-all-blog-posts`);
      const postId = allPostsResponse.data.data[0].id;
  
      const response = await axios.get(`${apiUrl}/api/delete-blog-post/${postId}`);
  
      expect(response.status).toBe(202);
      expect(response.data.status).toBe(202);
      expect(response.data.message).toBe('blog post deleted successfully');
    },15000);
  });
