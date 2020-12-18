<?php
/**
 * Plugin Name: Lever Postings
 */

add_action("rest_insert_postings", function (\WP_Post $post, $request, $creating)
{
    $metas = $request->get_param("meta");
    if (is_array($metas)) {
        foreach ($metas as $name => $value) {
            //update_post_meta($post->ID, $name, $value);
            update_field($name, $value, $post->ID);
        }
    }
}, 10, 3);

register_rest_field('postings', 'metadata', array(
    'get_callback' => function ($data) {
        return get_post_meta($data['id'], '', '' );
    },
));

add_filter('rest_postings_query', function( $args, $request ){
    if ( $item = $request->get_param( 'category_team' ) ) {
        $args['meta_key'] = 'category_team';
        $args['meta_value'] = $item;
    }
    if ( $item = $request->get_param( 'category_location' ) ) {
        $args['meta_key'] = 'category_location';
        $args['meta_value'] = $item;
    }
    if ( $item = $request->get_param( 'category_department' ) ) {
        $args['meta_key'] = 'category_department';
        $args['meta_value'] = $item;
    }
    if ( $item = $request->get_param( 'category_commitment' ) ) {
        $args['meta_key'] = 'category_commitment';
        $args['meta_value'] = $item;
    }
    return $args;
}, 10, 2 );
?>

