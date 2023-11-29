$('#orders tr.clickable').on('click', (e) => {
    const clickedTr = e.target.parentNode.nextElementSibling;
    $(clickedTr).toggle()
});

$('#page_reload').on('click', () => {
    window.location.href = "";
});

const fixStatusName = function (status) {
    if (status.includes('-')) {
        status = status.replace(/-/g, '_').trim();
    }
    return status.trim();
};

const statusColors = {
    new: 'yellow',
    in_new: '#D9E9FF',
    buying: '#FFFFD5',
    buy_error: '#ED4337',
    sent: '#C0D890',
    process: '#a8c0fc',
    steam: '#d3d3d3',
    trade_offers_limit: '#D08383',
    empty: '#B67070',
    steam_15: '#A16161',
    not_available_to_trade: '#C73535',
    bot: '#B02F2F',
    steam_403: '#9F3636',
    buy_success: '#63C57E'
};

const statusLength = {
    new: 30,
    buy_error: 50,
    sent: 100
};

const a = $('.progress-bar');

a.each(function () {
    let statusName = fixStatusName($(this).data('status'));
    let statusColor = statusColors[statusName];
    let statusWidth = statusLength[statusName];
    $(this).css('width', statusWidth + '%');
    $(this).css('background', statusColor);
    $(this).text(statusName).css('color', 'black');
});

const b = $('td .data_color');

b.each(function () {
    let statusName = fixStatusName($(this).text());
    $(this).css('background-color', statusColors[statusName]);
});
