<?php
/**
 * @file
 * This is currently a stub file that will be used to describe the addthis
 * implementation API.
 */

/**
 * Implements hook_TYPE_alter.
 *
 * @param array $options
 *   $options contains an array with configurations settings for used in the
 *   creation of the markup. The following elements may be in here.
 *
 *   - '#entity_type': The entity type this markup is define when called by a field.
 *   - '#entity': Is the entity object when called by a field.
 *   - '#display': Is always defined and provide all the formatter configuration.
 *   - '#url': The link to the entity when the entity has a url.
 */
function hook_addthis_markup_options_alter(&$options) {
  global $base_root;
  $options['#url'] = $base_root . request_uri();
}

/**
 * Implements hook_TYPE_alter.
 *
 * @param array $markup
 *   $markup contains an array with the structure of the addthis markup.
 */
function hook_addthis_markup_alter(&$markup) {

  // Let's add a custom CSS class for given a particular design to our
  // twitter button, so we can change the look.
  if (!empty($markup['twitter'])) {
    $markup['twitter']['#attributes']['class'][] = "custom_twitter_class";
  }
}
