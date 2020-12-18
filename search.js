function search(query, filter) {
  filter = filter === undefined ? {} : filter

  const url = '//mmg.vfg.mybluehost.me/careers/wp-json/wp/v2/postings'

  const queryParams = []
  Object.keys(filter).forEach((key, i) => {
    if (filter[key] === '') {
      return
    }

    queryParams.push(`filter[meta_query][${i}][key]=${encodeURIComponent(key)}`)
    queryParams.push(`filter[meta_query][${i}][value]=${encodeURIComponent(filter[key])}`)

    if (key === 'category_location') {
      queryParams.push(`filter[meta_query][${i}][compare]=LIKE`)
    }
  })

  if (query !== '') {
    queryParams.push(`search=${encodeURIComponent(query)}`)
  }
  queryParams.push('per_page=100')


  const finalURL = [url, queryParams.join('&')].join('?')

  fetch(finalURL).then(function (response) {
    return response.json()
  }).then(function (response) {
    document.querySelector('.elementor-posts-container').innerHTML = ''

    for (item of response) {

      const team = [
        item.metadata.category_team,
        item.metadata.category_department
      ].filter(x => x !== undefined).join(' - ')

      const searchItem = makeSearchItem(
        item.metadata.posting_name,
        team,
        item.metadata.category_location,
        item.metadata.apply_url
      )

      document.querySelector('.elementor-posts-container').appendChild(searchItem)
    }
  })
}

function makeSearchItem(title, department, location, url) {
  var div = document.createElement('div');
  div.innerHTML = `
<article class="elementor-post elementor-grid-item post-10876 post type-post status-publish format-standard hentry category-frontend-engineering category-product">
  <div class="elementor-post__text">
    <h3 class="elementor-post__title">
      <a href="${url}">${title}</a>
    </h3>
  <div class="elementor-post__excerpt">
    <p>${department}<br>${location}</p>
  </div>
  <a class="elementor-post__read-more" href="${url}">
    APPLY NOW</a>
  </div>
</article>
    `

  return div
}

function handleSearch(event) {
  const query = document.querySelector('#search-query').value
  const location = document.querySelector('#search-offices').value
  const [department, team] = document.querySelector('#search-teams').value.split(',')

  if (event !== undefined) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('office', location)
    searchParams.set('query', query)
    searchParams.set('team', document.querySelector('#search-teams').value)

    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    if (searchParams.toString() !== '')
      history.pushState(null, '', newRelativePathQuery);
  }

  search(query, {
    category_location: location || '',
    category_department: department || '',
    category_team: team || '',
  })
}

document.querySelector('#search-button').addEventListener('click', handleSearch)
document.querySelector('#search-offices').addEventListener('change', handleSearch)
document.querySelector('#search-teams').addEventListener('change', handleSearch)
document.querySelector('#search-query').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    handleSearch(e)
  }
})

const urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('query') !== null)
  document.querySelector('#search-query').value = urlParams.get('query')

if (urlParams.get('office') !== null)
  document.querySelector('#search-offices').value = urlParams.get('office')

if (urlParams.get('team') !== null && urlParams.get('team') !== '%2C')
  document.querySelector('#search-teams').value = urlParams.get('team')

handleSearch()
