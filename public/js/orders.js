$('#getOrders').click(function (e) {
    e.preventDefault();
    const searchValue = $('.selectedStatus').val();
    if(searchValue === 'default'){
        window.location.href = `${window.location.origin}${window.location.pathname}`;
    } else {
        window.location.href = `${window.location.origin}${window.location.pathname}?search=${searchValue}`;
    }
});

$('.pagination a').click(function (e) {
    e.preventDefault();

    const pagLink = $(this).attr('href');
    if(window.location.href.includes('?search')){
        const searchValue = clearSearchValue(window.location.search);
        window.location.href = `${window.location.origin}${window.location.pathname}?search=${searchValue}&${pagLink}`;
    } else {
        window.location.href = `${window.location.origin}${window.location.pathname}?${pagLink}`;
    }
});

const clearSearchValue = function (value){
    return value.split('&')[0].replace('?search=', '').trim();
}