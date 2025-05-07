document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-page')
    document.querySelectorAll('.page').forEach(section => {
      section.classList.remove('active')
    })
    document.getElementById(target).classList.add('active')
  })
})
