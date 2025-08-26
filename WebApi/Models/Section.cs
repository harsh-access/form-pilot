﻿namespace EditForm.Models
{
    public class Section
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public List<SubSection> SubSections { get; set; } = new();
    }
}
