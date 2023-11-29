import clients from '../../clients';
import flow from '../../flow';
import orders from '../../orders';
import responses from '../responses';
import ZbsError from '../../errors';

export function create(req, res) {
    const post = req.swagger.params.body.value;

    if (!clients.findByApiKey(post.sender.api_key)) {
        console.error('Client not found. Post: ', post);

        return responses.apiKeyValidationFailed(res);
    }

    orders.createFromRequest(post).then((orderId: number) => {

        if (post.config.hasOwnProperty('sync') && post.config.sync) {

            flow.process(orderId)
                .then(() => {
                    res.json({
                        result: 'success',
                        order_id: orderId,
                    });
                })
                .catch((err) => {
                    let type = 'internal';

                    if (err instanceof ZbsError) {
                        type = err.getType();
                    }

                    console.error('Error in process order', err);

                    res.json({
                        result: 'error',
                        type,
                        message: err.message,
                    })
                });
        } else {
            res.json({
                result: 'success',
                order_id: orderId,
            });

            flow.process(orderId)
                .then(() => console.log('Process order done'))
                .catch(err => console.error('Error in process order', err));
        }

    }).catch(ex => {
        console.error(ex);

        responses.error500(res);
    });
}

export function retry(req, res) {
    const post = req.swagger.params.body.value;

    const client = clients.findByApiKey(post.sender.api_key);
    if (!client) {
        return responses.apiKeyValidationFailed(res);
    }

    orders.isOwner(post.order_id, client).then(isOwner => {
        if (!isOwner) {
            return responses.ownerValidationFailed(res);
        }

        flow.update(post)
            .then(() => flow.retry(post.order_id))
            .then(() => console.log('Retry order done'))
            .catch(err => console.error('Error in retry order', err));

        res.json({ result: 'success' });

    }).catch(ex => {
        console.error(ex);

        responses.error500(res);
    });

}
