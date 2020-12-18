const WPAPI = require('wpapi')
const fetch = require('node-fetch')


const URL = 'http://mmg.vfg.mybluehost.me/careers/wp-json'
const USER = process.env.WP_USER
const TOKEN = process.env.WP_TOKEN

const wp = new WPAPI({
  endpoint: URL,
  username: USER,
  password: TOKEN,
})
wp.postings = wp.registerRoute('wp/v2', 'postings');


async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getLeverData() {
  const postings = await (await fetch('https://api.lever.co/v0/postings/vtex?mode=json')).json()
  const wp_postings = []

  for (const posting of postings) {
    const originalDescription = posting.description

    let title = ''
    title = 'ABOUT THE TEAM AND THE OPPORTUNITY'
    let indexPostingDesc = posting.description.indexOf(title)

    if (indexPostingDesc === -1) {
      title = 'About the team'
      indexPostingDesc = posting.description.indexOf(title)
    }
    if (indexPostingDesc === -1) {
      title = 'ABOUT THE TEAM AND OPPORTUNITY'
      indexPostingDesc = posting.description.indexOf(title)
    }
    if (indexPostingDesc === -1) {
      title = 'IN THIS ROLE, YOU WILL '
      indexPostingDesc = posting.description.indexOf(title)
    }
    if (indexPostingDesc === -1) {
      title = 'ABOUT THE POOL AND OPPORTUNITY'
      indexPostingDesc = posting.description.indexOf(title)
    }


    debugger
    if (indexPostingDesc !== -1) {
      posting.description = posting.description.substring(indexPostingDesc)

      indexPostingDesc = posting.description.indexOf('/div>')
      posting.description = posting.description.substring(indexPostingDesc + 5)

      posting.description = `<div>${title}</div>` + posting.description
    }

    let lists = ''
    posting.lists.forEach((item) => {
      lists += `<div style="list-header">${item.text}</div>`
      lists += `<div style="list-content">${item.content}</div>`
    })

    const wp_posting = {
      title: `${posting.text} - ${posting.categories.location}`,
      content: '',
      status: 'publish',
      slug: `${posting.text}-${posting.categories.location}`,

      meta: {
        posting_name: posting.text,
        category_commitment: posting.categories.commitment,
        category_department: posting.categories.department,
        category_location: posting.categories.location,
        category_team: posting.categories.team,

        hosted_url: posting.hostedUrl,
        apply_url: posting.applyUrl,
        created_at: posting.createdAt,

        about_us: ABOUT_US,
        our_culture: OUR_CULTURE,

        description: originalDescription,
        additional: posting.additional,
        lists: lists,
        about_the_team: posting.description,
      }
    }

    wp_postings.push(wp_posting)
  }

  return wp_postings
}

async function createPosts() {
  const log = x => console.log(x)

  const posts = await getLeverData()

  for (const post of posts) {
    // console.log(post);
    const resp = await wp.postings().create(post).then(log).catch(log)
    console.log(resp)
    await sleep(200)
  }
}

// async function getPosts

createPosts()



const ABOUT_US = `VTEX is the only multitenant commerce platform capable of unifying experiences in all sales channels. With a robust solution, scalable cloud infrastructure and powerful tooling, our platform accelerates the transformation of complex operations. More than 2900 renowned companies of varying sizes and segments, with operations in 42 countries and in global expansion, have at VTEX the solution for the online sale of their products, among them major names such as Sony, Motorola, Walmart, Whirlpool, Coca-Cola, Stanley Black & Decker, and Nestlé.`

const OUR_CULTURE = `<div><span style="font-size: 24px">OUR CULTURE</span></div><div><br></div><div><b>TRUST TO BE TRUSTED: </b>We trust each other without reservations and delegate our responsibilties <span style="font-size: 15px">continuously</span>. To be trustworthy you need honesty, transparency and consistency in quality and performance. This bond is built upon exchange: trust to be trusted.</div><div><br></div><div><b>BUILD FOR COMMUNITY:</b> It's all about being ready to grow and reach new levels together. When you have a solid foundation, modular thinking and a scalable essence, you're building for the community. We are global but we're audacious enough to aim for the stars.</div><div><br></div><div><b>BE BOLD: </b>Boldness is about challenging the status quo and not being afraid to make mistakes or take risks. We test new alternatives, walk into the unknown and explore possibilities no one thought about. To be bold is to apologize instead of asking for permission.</div>`
