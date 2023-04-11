/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const templateshop_config = {
  stripe_public_key_test: 'pk_test_Qcbf9eT6ohYTasFK0P8ZqSiG00KO5JwPle',  // test
  stripe_public_key_live: 'pk_live_JExuA50ardnvnuoJRyMbK5xX00cr48lVNN',  // live
  get stripe_public_key()
  {
    
    return (localStorage.getItem("use_test_server_app") === "true") ? templateshop_config.stripe_public_key_test : templateshop_config.stripe_public_key_live;
  },
  stripe_account_id: 'acct_1GKfNTIZQiszHmZV',
  checkoutSession: {
    URI: {
      stripe: 'https://checkout.stripe.com',
      local: 'https://templateshop.tinymobilerobots.com'
    },
    component: {
      success: 'CheckoutSessionSuccess',
      cancel: 'CheckoutSessionCancel',
      error: 'CheckoutSessionError'
    },
    URL: {
      get gateway()
      {
        return `${templateshop_config.checkoutSession.URI.stripe}`;
      },
      get success()
      {
        return `${templateshop_config.checkoutSession.URI.local}/${templateshop_config.checkoutSession.component.success}`;
      },
      get cancel()
      {
        return `${templateshop_config.checkoutSession.URI.local}/${templateshop_config.checkoutSession.component.cancel}`;
      },
      get error()
      {
        return `${templateshop_config.checkoutSession.URI.local}/${templateshop_config.checkoutSession.component.error}`;
      }
    }
  },
  stripe: function()
  {
    return Stripe( templateshop_config.stripe_public_key, {
      'stripeAccount': templateshop_config.stripe_account_id
    } );
  }
};