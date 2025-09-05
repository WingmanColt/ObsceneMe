namespace Entities.ViewModels
{
    public class Street
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class City
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Street> Streets { get; set; }
    }
}
