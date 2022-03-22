// const {graphql, buildSchema} = require('graphql');
const graphql = require('graphql');
const _ = require('lodash')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
    GraphQLID, // ensure it an number type either stringified number or number i.e 1 or "1"
    GraphQLString,
    GraphQLNonNull } = graphql
const Book = require('../models/book');
const Author = require('../models/author');
//dummy data
// var books = [
//     { name: "Gone with the wind", genre: "fantasy", id: "1", authorId: '1' },
//     { name: "Empires", genre: "fantasy", id: "2", authorId: '2' },
//     { name: "Inspirion", genre: "Sci-Fi", id: "3", authorId: '3' },
//     { name: "Narnia", genre: "fantasy", id: "4", authorId: '2' },
//     { name: "Lord of the rings", genre: "fantasy", id: "5", authorId: '3' },
//     { name: "Inspiron", genre: "Sci-Fi", id: "6", authorId: '3' },
// ]

// var authors = [
//     { name: "Sam Ethan", age: 26, id: "1" },
//     { name: "Terry Wiles", age: 90, id: "2" },
//     { name: "Landon Liandro", age: 12, id: "3" },
// ]

// here we define the types
const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({  // a function
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args) {
                console.log(parent)
                // return _.find(authors, { id: parent.authorId })
                return Author.findById(parent.authorId)
            }
        },
    }),
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({ // a function
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                // return _.filter(books, { authorId: parent.id })
                return Book.find({ authorId: parent.id })
            }
        }
    }),
})

// defines how to jump into the graph to get data
const RootQuery = new GraphQLObjectType({
    name: `RootQueryType`,
    fields: {
        book: {
            type: BookType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                // code to get data from db/ other source
                // return _.find(books, { id: args.id })
                return Book.findById(args.id)
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                // code to get data from db/ other source
                // return _.find(authors, { id: args.id })
                return Author.findById(args.id)
            }
        },
        books: { // root query for books // search for all books
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                return Book.find({})
            }
        },
        authors: { // search for all authors
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                return Author.find({})
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, args) {
                let author = new Author({ // the author type is gotten from our model
                    name: args.name,
                    age: args.age
                })
                return author.save() // saves to database
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId,
                })
                return book.save()
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})