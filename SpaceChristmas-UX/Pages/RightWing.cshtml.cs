﻿using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SpaceChristmas_UX.Pages
{
    public class RightWingModel : PageModel
    {
        private readonly ILogger<RightWingModel> _logger;

        public RightWingModel(ILogger<RightWingModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}
