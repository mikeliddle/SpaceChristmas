using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SpaceChristmas_UX.Pages
{
    public class CaptainModel : PageModel
    {
        private readonly ILogger<CaptainModel> _logger;

        public CaptainModel(ILogger<CaptainModel> logger)
        {
            _logger = logger;
        }
        public void OnGet()
        {

        }
    }
}