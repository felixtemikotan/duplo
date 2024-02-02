
import fastify from 'fastify';
import { Prisma,PrismaClient } from '@prisma/client';
import 'dotenv/config';
import Joi from "joi";
const Port = process.env.PORT || 4000;
const prisma = new PrismaClient();
const app = fastify({ logger: true });

app.listen({ port: 4000 })
  .then((address:string) => console.log(`server listening on ${address}`))
  .catch(err => {
    console.log('Error starting server:', err)
    process.exit(1)
  })


// Data validator starts here
 const addPostValidator = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  author: Joi.string().required()
  });

   const updatePostValidator1 = Joi.object({
    id:Joi.string().required(),
    title: Joi.string().optional().allow('',' ',null),
    content: Joi.string().optional().allow('',' ',null),
    author: Joi.string().optional().allow('',' ',null),
    });

     const updatePostValidator = Joi.object({
      id: Joi.string().required(),
      title: Joi.string().allow(null, ''),
      content: Joi.string().allow(null, ''),
      author: Joi.string().allow(null, ''),
    }).or('title', 'content', 'author');

     const paramsValidator = Joi.object({
      id:Joi.string().required(),
      });

   const options = {
    abortEarly: false,
    errors: {
      wrap: {
        label: ''
      }
    }
  };

  // Data validator ends here
  // Controller starts here
  const blogController: any = {};
  blogController.addNewPost = async (req: { body: any; }, reply: any) => {
    try {
        const {error} = addPostValidator.validate(req.body,options)
        if(error){
            console.log(error.details[0].message);
            return {
                status:400,
                message:error.details[0].message
            }
        }
    const newpost = await prisma.blogPost.create({
        data: req.body
    })
    const allBlogPost = await prisma.blogPost.findMany({
        orderBy: [
          {
            dateUpdated: 'desc'
          }
        ]
        })
        return reply.code(201).send({status:201, message: "Blog post added successfully", data:allBlogPost});
    } catch(e:any){
        const response =  e instanceof Prisma.PrismaClientKnownRequestError  && e.code === 'P2002' ? { status: 400, message: "Blog title already exist", column: e?.meta?.target, error: "duplicate exist" } : { status: 500, error:e?.message}
        reply.code(200).send(response)
    }
    }

    blogController.getAllPosts = async (req: any, reply: any) => {     
    try{
        const allBlogPost = await prisma.blogPost.findMany({
            orderBy: [
              {
                dateUpdated: 'desc'
              }
            ]
            })
        return reply.code(200).send({status:200, message: "All blog post retrieved successfully", data:allBlogPost});
    }catch(e:any){
        const response =  e instanceof Prisma.PrismaClientKnownRequestError  && e.code === 'P2002' ? { status: 400, message: "Blog title already exist", column: e?.meta?.target, error: "duplicate exist" } : { status: 500, error:e?.message}
        reply.code(200).send(response)
    }
}

blogController.getSinglePost = async (req: { params: { id: any; }; }, reply: any) => {
    try {
    const id = req.params.id
    const {error} = paramsValidator.validate({id:id},options)
    if(error){
        console.log(error.details[0].message);
        return {
            status:400,
            message:error.details[0].message
        }
    }
    let post = await  await prisma.blogPost.findUnique({
        where: {
            id: String(id)
        }
    })
    return reply.code(200).send({status:200, message: post == null ? "Invalid Id": "Blog post retrieved successfully", data:post});
    }catch(e:any){
        const response =  e instanceof Prisma.PrismaClientKnownRequestError  && e.code === 'P2002' ? { status: 400, message: "Blog title already exist", column: e?.meta?.target, error: "duplicate exist" } : { status: 500, error:e?.message}
        reply.code(200).send(response)
    }
}

blogController.updatePost = async (req: { params: { id: any; }; body: any; }, reply: any) => {
    try {
    const id = req.params.id
    const {error} = updatePostValidator.validate({...req.body,id:req.params?.id},options)
    if(error){
        console.log(error.details[0].message);
        return {
            status:400,
            message:error.details[0].message
        }
    }
    let result = await prisma.blogPost.update({
        where: {
            id: String(id)
        },
        data: req.body
    })
    const allBlogPost = await prisma.blogPost.findMany({
        orderBy: [
          {
            dateUpdated: 'desc'
          }
        ]
        })
        return reply.code(200).send({status:200, message: "Blog post updated successfully", data:allBlogPost});
    } catch(e:any){
        console.log(e.code)
        const response =  e instanceof Prisma.PrismaClientKnownRequestError  && e.code === 'P2025' ? { status: 400, message: "Either this blogpost has been deleted or it does not exist", column: e?.meta?.target, error: "Not found error" } : { status: 500, error:e?.message}
        reply.code(200).send(response)
      }
}

blogController.deletePost = async (req: { params: { id: any; }; }, reply: any) => {
    try {
        const id = req.params.id
        const {error} = paramsValidator.validate({id:id},options)
        if(error){
            console.log(error.details[0].message);
            return {
                status:400,
                message:error.details[0].message
            }
        }
   
    await prisma.blogPost.delete({
        where: {
            id: String(id)
        }
    })
    const allBlogPost = await prisma.blogPost.findMany({
        orderBy: [
          {
            dateUpdated: 'desc'
          }
        ]
        })
        return reply.code(202).send({status:202, message: "blog post deleted successfully", data:allBlogPost});
    } catch(e:any){
        console.log(e.code)
        const response =  e instanceof Prisma.PrismaClientKnownRequestError  && e.code === 'P2025' ? { status: 400, message: "Either this blogpost has been deleted or it does not exist", column: e?.meta?.target, error: "Not found error" } : { status: 500, error:e?.message}
        reply.code(200).send(response)
      }
}

// Controller ends here

// Routes starts here
const routes = [{
        method: 'GET',
        url: '/api/get-all-blog-posts',
        handler: blogController.getAllPosts
    },
    {
        method: 'GET',
        url: '/',
        handler: blogController.getAllPosts
    },
    {
        method: 'GET',
        url: '/api/get-single-blog-post/:id',
        handler: blogController.getSinglePost
    },
    {
        method: 'POST',
        url: '/api/add-blog-post',
        handler: blogController.addNewPost,
    },
    {
        method: 'POST',
        url: '/api/update-blog-post/:id',
        handler: blogController.updatePost
    },
    {
        method: 'GET',
        url: '/api/delete-blog-post/:id',
        handler: blogController.deletePost
    }
];
// Routes ends here
routes.forEach((route:any, index:any) => {
  app.route(route)
})