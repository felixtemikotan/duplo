"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const client_1 = require("@prisma/client");
require("dotenv/config");
const joi_1 = __importDefault(require("joi"));
const Port = process.env.PORT || 4000;
const prisma = new client_1.PrismaClient();
const app = (0, fastify_1.default)({ logger: true });
app.listen({ port: 4000 })
    .then((address) => console.log(`server listening on ${address}`))
    .catch(err => {
    console.log('Error starting server:', err);
    process.exit(1);
});
// Data validator starts here
const addPostValidator = joi_1.default.object({
    title: joi_1.default.string().required(),
    content: joi_1.default.string().required(),
    author: joi_1.default.string().required()
});
const updatePostValidator1 = joi_1.default.object({
    id: joi_1.default.string().required(),
    title: joi_1.default.string().optional().allow('', ' ', null),
    content: joi_1.default.string().optional().allow('', ' ', null),
    author: joi_1.default.string().optional().allow('', ' ', null),
});
const updatePostValidator = joi_1.default.object({
    id: joi_1.default.string().required(),
    title: joi_1.default.string().allow(null, ''),
    content: joi_1.default.string().allow(null, ''),
    author: joi_1.default.string().allow(null, ''),
}).or('title', 'content', 'author');
const paramsValidator = joi_1.default.object({
    id: joi_1.default.string().required(),
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
const blogController = {};
blogController.addNewPost = async (req, reply) => {
    try {
        const { error } = addPostValidator.validate(req.body, options);
        if (error) {
            console.log(error.details[0].message);
            return {
                status: 400,
                message: error.details[0].message
            };
        }
        const newpost = await prisma.blogPost.create({
            data: req.body
        });
        const allBlogPost = await prisma.blogPost.findMany({
            orderBy: [
                {
                    dateUpdated: 'desc'
                }
            ]
        });
        return reply.code(201).send({ status: 201, message: "Blog post added successfully", data: allBlogPost });
    }
    catch (e) {
        const response = e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002' ? { status: 400, message: "Blog title already exist", column: e?.meta?.target, error: "duplicate exist" } : { status: 500, error: e?.message };
        reply.code(200).send(response);
    }
};
blogController.getAllPosts = async (req, reply) => {
    try {
        const allBlogPost = await prisma.blogPost.findMany({
            orderBy: [
                {
                    dateUpdated: 'desc'
                }
            ]
        });
        return reply.code(200).send({ status: 200, message: "All blog post retrieved successfully", data: allBlogPost });
    }
    catch (e) {
        const response = e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002' ? { status: 400, message: "Blog title already exist", column: e?.meta?.target, error: "duplicate exist" } : { status: 500, error: e?.message };
        reply.code(200).send(response);
    }
};
blogController.getSinglePost = async (req, reply) => {
    try {
        const id = req.params.id;
        const { error } = paramsValidator.validate({ id: id }, options);
        if (error) {
            console.log(error.details[0].message);
            return {
                status: 400,
                message: error.details[0].message
            };
        }
        let post = await await prisma.blogPost.findUnique({
            where: {
                id: String(id)
            }
        });
        return reply.code(200).send({ status: 200, message: post == null ? "Invalid Id" : "Blog post retrieved successfully", data: post });
    }
    catch (e) {
        const response = e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002' ? { status: 400, message: "Blog title already exist", column: e?.meta?.target, error: "duplicate exist" } : { status: 500, error: e?.message };
        reply.code(200).send(response);
    }
};
blogController.updatePost = async (req, reply) => {
    try {
        const id = req.params.id;
        const { error } = updatePostValidator.validate({ ...req.body, id: req.params?.id }, options);
        if (error) {
            console.log(error.details[0].message);
            return {
                status: 400,
                message: error.details[0].message
            };
        }
        let result = await prisma.blogPost.update({
            where: {
                id: String(id)
            },
            data: req.body
        });
        const allBlogPost = await prisma.blogPost.findMany({
            orderBy: [
                {
                    dateUpdated: 'desc'
                }
            ]
        });
        return reply.code(200).send({ status: 200, message: "Blog post updated successfully", data: allBlogPost });
    }
    catch (e) {
        console.log(e.code);
        const response = e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2025' ? { status: 400, message: "Either this blogpost has been deleted or it does not exist", column: e?.meta?.target, error: "Not found error" } : { status: 500, error: e?.message };
        reply.code(200).send(response);
    }
};
blogController.deletePost = async (req, reply) => {
    try {
        const id = req.params.id;
        const { error } = paramsValidator.validate({ id: id }, options);
        if (error) {
            console.log(error.details[0].message);
            return {
                status: 400,
                message: error.details[0].message
            };
        }
        await prisma.blogPost.delete({
            where: {
                id: String(id)
            }
        });
        const allBlogPost = await prisma.blogPost.findMany({
            orderBy: [
                {
                    dateUpdated: 'desc'
                }
            ]
        });
        return reply.code(202).send({ status: 202, message: "blog post deleted successfully", data: allBlogPost });
    }
    catch (e) {
        console.log(e.code);
        const response = e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2025' ? { status: 400, message: "Either this blogpost has been deleted or it does not exist", column: e?.meta?.target, error: "Not found error" } : { status: 500, error: e?.message };
        reply.code(200).send(response);
    }
};
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
routes.forEach((route, index) => {
    app.route(route);
});
module.exports = routes;
